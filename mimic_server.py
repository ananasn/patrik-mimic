import os
import json
import logging
from logging import (warning, info,
                      error)
import tornado.web
import tornado.websocket
import tornado.ioloop

HOST = "127.0.0.1"
PORT = 8001

logging.basicConfig(filename='mimic-server.log',
                     level=logging.DEBUG)
logging.getLogger().addHandler(logging.StreamHandler())

class Web():

    class HTTPHandler(tornado.web.RequestHandler):
        def get(self):
            self.write("Hello, I'am mimic app")

        def post(self):
            #data = self.get_argument('data', 'No data received')
            pass

        
    class WebSocketHandler(tornado.websocket.WebSocketHandler):
            
            def check_origin(self, origin):
                return True
            
            def open(self):
                info("Mimic websocket opened")
                pass

            def on_close(self):
                info("Mimic webcoket closed")

            def on_message(self, m):
                pass

            def msg(self, data):
                self.write_message(json.dumps({"data": data}))
                
    def __init__(self):
        settings = {"static_path": os.path.join(os.path.dirname(os.path.abspath(__file__)), "inc")}

        application = tornado.web.Application([
            (r"/", self.HTTPHandler),
            (r"/websocket", self.WebSocketHandler),
            (r"/static/(.*)", tornado.web.StaticFileHandler, {"path": settings["static_path"]},),
            (r"/layers/(.*)", tornado.web.StaticFileHandler, {"path": "./layers/"},),

        ], **settings)

        application.listen(PORT)
        info("Web start at port %s." % PORT)




if __name__ == '__main__':
    web = Web()
    tornado.ioloop.IOLoop.current().start()
