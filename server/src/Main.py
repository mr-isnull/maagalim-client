#!/usr/bin/python

'''
Created on Feb 14, 2014

@author: daniel
'''
from argparse import ArgumentParser
from webapp2 import WSGIApplication
from paste.urlparser import StaticURLParser
from paste.cascade import Cascade
from paste import httpserver

class Server(object):
    def __init__(self, port):
        self.__port = port
        routes = [
                    ('/', ),
                 ]
        html_app = StaticURLParser('html/')
        css_app = StaticURLParser('css/')
        js_app = StaticURLParser('js/')
        fonts_app = StaticURLParser('fonts/')
        partials_app = StaticURLParser('partials/')
        web_app = WSGIApplication(routes, debug=True, config=self.__config)
        self.__app = Cascade([html_app, css_app, js_app, fonts_app, partials_app, web_app])
        httpserver.serve(self.__app, host='', port=port)


if __name__ == '__main__':
    arg_parser = ArgumentParser()
    arg_parser.add_argument('-p', '--port', type=int, defualt=9000, help='port to listen')
    args = arg_parser.parse_args()
    server = Server(args.port)
    try:
        server.run()
    finally: 
        print 'done.'

