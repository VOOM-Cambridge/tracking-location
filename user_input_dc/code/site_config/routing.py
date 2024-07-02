from channels.routing import ProtocolTypeRouter, URLRouter
import channels.staticfiles
from channels.auth import AuthMiddlewareStack
import input.routing


application = ProtocolTypeRouter({
        'websocket': AuthMiddlewareStack(
            URLRouter(
                input.routing.websocket_urlpatterns
            )
        ),
    })
