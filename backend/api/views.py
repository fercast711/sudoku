from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import numpy as np
from keras.api.models import load_model
import logging
from django.conf import settings

fmt = getattr(settings, 'LOG_FORMAT', None)
lvl = getattr(settings, 'LOG_LEVEL', logging.DEBUG)

logging.basicConfig(format=fmt, level=lvl)
model = load_model("api/model_save.keras")

class Sudoku(APIView):
    def post(self, request):
        quiz = request.data.get('quiz', None)
        if quiz is None:
            return Response({'error': 'No se encontró la clave "quiz" en los datos de la solicitud'}, status=status.HTTP_400_BAD_REQUEST)
        
        quiz = list(map(int, list(quiz)))
        quiz = (np.array(quiz).reshape(9,9,1)/9) - 0.5

        while True:
            predict = model.predict(quiz.reshape(1,9,9,1)).squeeze()
            quizSolved = np.argmax(predict, axis=1).reshape((9, 9)) + 1
            probSolved = np.around(np.max(predict, axis=1).reshape((9, 9)), 2)
            
            quiz = ((quiz+0.5)*9).reshape(9,9)
            zeroMask = (quiz==0)

            if zeroMask.sum() == 0:
                break

            probSolvedNew = probSolved * zeroMask
            idx = np.argmax(probSolvedNew)
            x, y = (idx // 9), (idx % 9)

            quiz[x][y] = quizSolved[x][y]
            quiz = (quiz / 9) - 0.5
        

        #quiz = quiz.reshape(81)
        res = {'solution': quiz}
        return Response(res, status=status.HTTP_200_OK)