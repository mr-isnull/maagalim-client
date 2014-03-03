#!/usr/bin/python

'''
Created on Feb 14, 2014

@author: daniel
'''
from argparse import ArgumentParser
import mimetypes
import os
from webapp2 import WSGIApplication, RequestHandler
from paste.urlparser import StaticURLParser
from paste.cascade import Cascade
from paste import httpserver

root_dir = os.path.abspath(__file__)
while not os.path.exists(os.path.join(root_dir, 'index.html')):
    root_dir = os.path.abspath(os.path.join(root_dir, os.path.pardir))

class GeneralHandler(RequestHandler):
    def get(self):
        index_path = os.path.join(root_dir, 'index.html')
        with open(index_path) as index_file:
            content = index_file.read()

        self.response.headers['Content-Type'] = mimetypes.guess_type(index_path)
        self.response.write(content)

class TestHandler(RequestHandler):
    def get(self):
        test_path = os.path.join(root_dir, 'test.html')
        with open(test_path) as test_file:
            content = test_file.read()

        self.response.headers['Content-Type'] = mimetypes.guess_type(test_path)
        self.response.write(content)


class Server(object):
    def __init__(self, port):
        self.__port = port
        routes = [
		    ('/test', TestHandler),
                    (r'/.*', GeneralHandler)
                 ]
        static_app = StaticURLParser(root_dir)
        web_app = WSGIApplication(routes, debug=True)
        self.__app = Cascade([static_app, web_app])
        httpserver.serve(self.__app, host='', port=port)


if __name__ == '__main__':
    arg_parser = ArgumentParser()
    arg_parser.add_argument('-p', '--port', type=int, default=9000, help='port to listen')
    args = arg_parser.parse_args()
    server = Server(args.port)
    try:
        server.run()
    finally: 
        print 'done.'

