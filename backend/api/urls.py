from django.urls import include, path
from api.views import Sudoku

urlpatterns = [
    path('sudoku/', Sudoku.as_view(), name='sudoku')
]