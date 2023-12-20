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



class WebsocketRegistry:
    def __init__(self):
        self.active_websockets = []

    def add_listener(self, listener):
        self.active_websockets.append(listener)

    def remove_listener(self, listener):
        self.active_websockets.remove(listener)

    def send_messages(self, msg_txt):
        print(self.active_websockets)
        for ws in self.active_websockets:
            ws.write_message(msg_txt)

registry = WebsocketRegistry()


class Web():

    class HTTPHandler(tornado.web.RequestHandler):
        def get(self):
            self.render("mimic.html")

        def post(self):
            data = json.loads(self.request.body)
            print('data', data)
            global registry
            registry.send_messages(data)
            return

    class WebSocketHandler(tornado.websocket.WebSocketHandler):
            
            def check_origin(self, origin):
                return True
            
            def open(self):
                info("Mimic websocket opened")
                global registry
                registry.add_listener(self)

            def on_close(self):
                info("Mimic webcoket closed")
                global registry
                registry.remove_listener(self)

            def on_message(self, m):
                pass

                
    def __init__(self):
        settings = {"static_path": os.path.dirname(os.path.abspath(__file__))}
        print(settings)
        application = tornado.web.Application([
            (r"/", self.HTTPHandler),
            (r"/websocket", self.WebSocketHandler),
            (r"/(.*)", tornado.web.StaticFileHandler, {"path": settings["static_path"]},),
        ], **settings)

        application.listen(PORT)
        info("Web start at port %s." % PORT)




if __name__ == '__main__':
    web = Web()
    tornado.ioloop.IOLoop.current().start()
