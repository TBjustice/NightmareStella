import webview
window = webview.create_window("Nighmare Stella", url="game.html")
webview.start(http_server=True, debug=True)