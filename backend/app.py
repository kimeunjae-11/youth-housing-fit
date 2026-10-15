import json,os
from wsgiref.simple_server import make_server,WSGIRequestHandler
from service import judge,recommend,read

ORIGINS={x.strip() for x in os.getenv('CORS_ORIGINS','https://youth-housing-fit.vercel.app,http://localhost:5173,http://localhost:3000').split(',') if x.strip()}
def application(env,start_response):
    headers=[('Content-Type','application/json; charset=utf-8'),('Cache-Control','no-store'),('Vary','Origin'),('X-Content-Type-Options','nosniff')]
    origin=env.get('HTTP_ORIGIN')
    if origin in ORIGINS:
        headers += [('Access-Control-Allow-Origin',origin),('Access-Control-Allow-Methods','GET, POST, OPTIONS'),('Access-Control-Allow-Headers','Content-Type')]
    def respond(status,payload):
        data=json.dumps(payload,ensure_ascii=False,allow_nan=False).encode()
        start_response(status,headers+[('Content-Length',str(len(data)))])
        return [data]
    path=env.get('PATH_INFO'); method=env.get('REQUEST_METHOD')
    if method=='OPTIONS': return respond('200 OK',{})
    if method=='GET' and path=='/health': return respond('200 OK',dict(status='ok',data_as_of=read('housing.json')['data_as_of']))
    if method=='GET' and path=='/api/housing': return respond('200 OK',read('housing.json'))
    routes={'/api/eligibility':judge,'/api/recommendations':recommend}
    if path not in routes: return respond('404 Not Found',dict(error='경로를 확인하세요'))
    if method!='POST': return respond('405 Method Not Allowed',dict(error='POST를 사용하세요'))
    if env.get('CONTENT_TYPE','').split(';')[0].strip()!='application/json': return respond('415 Unsupported Media Type',dict(error='application/json 필요'))
    try:
        length=int(env.get('CONTENT_LENGTH') or 0)
        if not 0<length<=16384: return respond('413 Content Too Large',dict(error='본문은 1~16384바이트여야 합니다'))
        profile=json.loads(env['wsgi.input'].read(length))
        return respond('200 OK',routes[path](profile))
    except (ValueError,UnicodeDecodeError) as exc:
        # Never echo arbitrary request contents into logs or responses.
        return respond('422 Unprocessable Entity',dict(error=str(exc) if isinstance(exc,ValueError) and str(exc).startswith('필수 항목을 입력하세요:') else '입력 형식·숫자 범위·허용 항목을 API 문서에서 확인하세요'))
class QuietHandler(WSGIRequestHandler):
    def log_message(self,*args): pass
if __name__=='__main__':
    port=int(os.getenv('PORT','8000'))
    print(f'로컬 API: http://127.0.0.1:{port}/health')
    with make_server('127.0.0.1',port,application,handler_class=QuietHandler) as server: server.serve_forever()
