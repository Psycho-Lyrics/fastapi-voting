import typer
from typer import Option

from src.fastapi_voting.run import main

from src.fastapi_voting.app.core.settings import get_settings

run_app_typer = typer.Typer()
settings = get_settings()

@run_app_typer.command()
def start(
        reload: bool = False,
):
    main(reload=reload)