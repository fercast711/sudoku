from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import numpy as np
from keras.api.models import load_model
import logging
from django.conf import settings
import threading

fmt = getattr(settings, 'LOG_FORMAT', None)
lvl = getattr(settings, 'LOG_LEVEL', logging.DEBUG)

logging.basicConfig(format=fmt, level=lvl)
model = load_model("api/model_save.keras")
solutions = [None, None]

def isValidSudoku(dashboard):
    arr = np.array(dashboard).reshape((9,9))

    for row in arr:
        if not isValidUnit(row):
            return False

    for col in range(9):
        if not isValidUnit([arr[row][col] for row in range(9)]):
            return False

    for boxRow in range(3):
        for boxCol in range(3):
            box = []
            for i in range(3):
                for j in range(3):
                    box.append(arr[boxRow * 3 + i][boxCol * 3 + j])
            if not isValidUnit(box):
                return False

    return True

def isValidUnit(unit):
    seen = set()
    for num in unit:
        if num != 0:
            if num in seen:
                return False
            seen.add(num)
    return True

def solveSudokuModel(quiz):
    quiz = np.array(quiz).reshape(9,9)
    while True:
        zeroMask = (quiz==0)

        if zeroMask.sum() == 0:
            break
        
        quiz = (quiz / 9) - 0.5

        predict = model.predict(quiz.reshape(1,9,9,1)).squeeze()
        quizSolved = np.argmax(predict, axis=1).reshape((9, 9)) + 1
        probSolved = np.around(np.max(predict, axis=1).reshape((9, 9)), 2)
        
        quiz = ((quiz+0.5)*9)

        probSolvedNew = probSolved * zeroMask
        highConfidence = probSolvedNew > 0.97
        mediumConfidence = probSolvedNew > 0.95
        lowerConfidence = probSolvedNew > 0.93

        if np.any(highConfidence):
            for x, y in zip(*np.where(highConfidence)):
                quiz[x][y] = quizSolved[x][y]
            
        elif np.any(mediumConfidence):
            for x, y in zip(*np.where(mediumConfidence)):
                quiz[x][y] = quizSolved[x][y]
            
        elif np.any(lowerConfidence):
            for x, y in zip(*np.where(lowerConfidence)):
                quiz[x][y] = quizSolved[x][y]
                
        else:
            idx = np.argmax(probSolvedNew)
            x, y = (idx // 9), (idx % 9)
            quiz[x][y] = quizSolved[x][y]



    solutions[0] = quiz

def solveSudokuBacktracking(quiz):

    def findNumInRow(arr, row, num):
        for i in range(9):
            if arr[row][i] == num:
                return True
        
        return False
    
    def findNumInCol(arr, col, num):
        for i in range(9):
            if arr[i][col] == num:
                return True
        
        return False
    
    def findNumInBox(arr, row, col, num):
        startRow = row - row % 3
        startCol = col - col % 3

        for i in range(3):
            for j in range(3):
                if arr[startRow+i][startCol+j] == num:
                    return True
        
        return False

    def checkLocationIsSafe(arr, row, col, num):
        return not findNumInRow(arr, row, num) and not findNumInCol(arr, col, num) and not findNumInBox(arr, row, col, num)

    def findEmptyCell(arr, l):
        for row in range(9):
            for col in range(9):
                if arr[row][col] == 0:
                    l[0] = row
                    l[1] = col
                    return True
        
        return False

    def solveSudoku(arr):
        l = [0,0]

        if not findEmptyCell(arr, l):
            return True
        
        row = l[0]
        col = l[1]

        for num in range(1,10):
            if checkLocationIsSafe(arr, row, col, num):
                arr[row][col] = num
            
                if solveSudoku(arr):
                    return True
                
                arr[row][col] = 0
        
        return False
    
    temp = np.array(quiz).reshape((9,9))
    if solveSudoku(temp): solutions[1] = temp
    else: solutions[1] = None
        

class Sudoku(APIView):
    def post(self, request):
        quiz = request.data.get('quiz', None)
        if quiz is None:
            return Response({'error': "No se encontró la clave 'quiz' en los datos de la solicitud"}, status=status.HTTP_400_BAD_REQUEST)

        if len(quiz) < 81:
            return Response({'error': "'quiz' Debe de tener al menos 81 elementos"}, status=status.HTTP_400_BAD_REQUEST)
        
        quiz = list(map(int, list(quiz)))

        if not isValidSudoku(quiz):
            logging.debug("El quiz no tiene solucion")
            return Response({'error': 'El quiz enviado por el usuario no tiene respuesta'}, status=status.HTTP_400_BAD_REQUEST)

        threadModel = threading.Thread(target=solveSudokuModel, args=(quiz,))
        threadBacktracking = threading.Thread(target=solveSudokuBacktracking, args=(quiz,))

        threadModel.start()
        threadBacktracking.start()

        threadModel.join()
        threadBacktracking.join()

        if solutions[1] is None:
            logging.debug("El quiz no tiene solucion")
            return Response({'error': 'El quiz enviado por el usuario no tiene respuesta'}, status=status.HTTP_400_BAD_REQUEST)

        res = {'solution': None}

        if np.array_equal(solutions[0], solutions[1]):
            logging.debug("El modelo acertó el resultado")
            res['solution'] = solutions[0]
            return Response(res, status=status.HTTP_200_OK)
        else:
            logging.debug("El modelo falló el resultado")
            res['solution'] = solutions[1]
            return Response(res, status=status.HTTP_200_OK)