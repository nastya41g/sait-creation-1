import json
import base64
import os
import hashlib
import secrets
import re
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}
EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')


def resp(status, data):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps(data, ensure_ascii=False, default=str)}


def q(v):
    if v is None or v == '':
        return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"


def hash_pw(password, salt=None):
    salt = salt or secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
    return f'{salt}${h}'


def check_pw(password, stored):
    salt = stored.split('$')[0]
    return hash_pw(password, salt) == stored


def user_json(row):
    return {'id': row[0], 'email': row[1], 'firstName': row[2], 'lastName': row[3],
            'birth': row[4].isoformat() if row[4] else '', 'phone': row[5] or '',
            'notifyPurchases': row[6], 'notifyPromo': row[7]}


USER_COLS = 'id, email, first_name, last_name, birth_date, phone, notify_purchases, notify_promo'


def new_session(cur, user_id):
    token = secrets.token_hex(32)
    cur.execute(f"INSERT INTO {SCHEMA}.sessions (token, user_id) VALUES ({q(token)}, {int(user_id)})")
    return token


def handler(event: dict, context) -> dict:
    """Аккаунты BestGames: регистрация, вход, выход, профиль, смена пароля и история покупок."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'me')
    raw = event.get('body') or ''
    if raw and event.get('isBase64Encoded'):
        raw = base64.b64decode(raw).decode('utf-8')
    try:
        body = json.loads(raw) if raw else {}
    except ValueError:
        body = {}
    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    token = headers.get('x-auth-token', '')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor()
    try:
        if action == 'register':
            email = (body.get('email') or '').strip().lower()
            pw = body.get('password') or ''
            first, last = (body.get('firstName') or '').strip(), (body.get('lastName') or '').strip()
            if not EMAIL_RE.match(email) or len(pw) < 6 or not first or not last:
                return resp(400, {'error': 'Заполните все поля корректно'})
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = {q(email)}")
            if cur.fetchone():
                return resp(409, {'error': 'Этот e-mail уже зарегистрирован'})
            cur.execute(
                f"INSERT INTO {SCHEMA}.users (email, password_hash, first_name, last_name, birth_date, phone) "
                f"VALUES ({q(email)}, {q(hash_pw(pw))}, {q(first)}, {q(last)}, {q(body.get('birth'))}, {q(body.get('phone'))}) "
                f"RETURNING {USER_COLS}")
            row = cur.fetchone()
            return resp(200, {'token': new_session(cur, row[0]), 'user': user_json(row)})

        if action == 'login':
            email = (body.get('email') or '').strip().lower()
            cur.execute(f"SELECT password_hash, {USER_COLS} FROM {SCHEMA}.users WHERE email = {q(email)}")
            row = cur.fetchone()
            if not row or not check_pw(body.get('password') or '', row[0]):
                return resp(401, {'error': 'Неверный e-mail или пароль'})
            return resp(200, {'token': new_session(cur, row[1]), 'user': user_json(row[1:])})

        if not token:
            return resp(401, {'error': 'Нужно войти в аккаунт'})
        cur.execute(
            f"SELECT u.password_hash, {', '.join('u.' + c.strip() for c in USER_COLS.split(','))} "
            f"FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id WHERE s.token = {q(token)}")
        row = cur.fetchone()
        if not row:
            return resp(401, {'error': 'Сессия истекла, войдите снова'})
        pw_hash, user = row[0], user_json(row[1:])
        uid = user['id']

        if action == 'logout':
            cur.execute(f"DELETE FROM {SCHEMA}.sessions WHERE token = {q(token)}")
            return resp(200, {'ok': True})

        if action == 'update':
            first, last = (body.get('firstName') or '').strip(), (body.get('lastName') or '').strip()
            if not first or not last:
                return resp(400, {'error': 'Укажите имя и фамилию'})
            cur.execute(
                f"UPDATE {SCHEMA}.users SET first_name = {q(first)}, last_name = {q(last)}, "
                f"birth_date = {q(body.get('birth'))}, phone = {q(body.get('phone'))}, "
                f"notify_purchases = {'TRUE' if body.get('notifyPurchases', user['notifyPurchases']) else 'FALSE'}, "
                f"notify_promo = {'TRUE' if body.get('notifyPromo', user['notifyPromo']) else 'FALSE'} "
                f"WHERE id = {uid} RETURNING {USER_COLS}")
            return resp(200, {'user': user_json(cur.fetchone())})

        if action == 'password':
            if not check_pw(body.get('old') or '', pw_hash):
                return resp(400, {'error': 'Текущий пароль неверный'})
            if len(body.get('next') or '') < 6:
                return resp(400, {'error': 'Новый пароль — минимум 6 символов'})
            cur.execute(f"UPDATE {SCHEMA}.users SET password_hash = {q(hash_pw(body['next']))} WHERE id = {uid}")
            return resp(200, {'ok': True})

        if action == 'buy':
            title = (body.get('title') or '').strip()
            price = int(body.get('price') or 0)
            if not title or price <= 0:
                return resp(400, {'error': 'Некорректная покупка'})
            cur.execute(f"INSERT INTO {SCHEMA}.purchases (user_id, title, price) VALUES ({uid}, {q(title)}, {price})")
            return resp(200, {'ok': True})

        cur.execute(f"SELECT title, price, created_at FROM {SCHEMA}.purchases WHERE user_id = {uid} ORDER BY created_at DESC")
        purchases = [{'title': r[0], 'price': r[1], 'date': r[2].isoformat()} for r in cur.fetchall()]
        return resp(200, {'user': user, 'purchases': purchases})
    finally:
        cur.close()
        conn.close()