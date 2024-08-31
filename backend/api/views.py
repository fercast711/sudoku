from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class Sudoku(APIView):
    def get(self, request):
        res = {'message': 'Hello world'}
        return Response(res, status=status.HTTP_200_OK)