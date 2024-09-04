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

def solveSudokuModel(quiz):
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
        highConfidence = probSolvedNew >= 0.97
        mediumConfidence = probSolvedNew >= 0.95
        lowerConfidence = probSolvedNew >= 0.9

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


        quiz = (quiz / 9) - 0.5
    
    return quiz

def solveSudokuBacktracking(quiz, predict):

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
    
    def solveSudokuIA(arr):
        l = [0,0]

        if not findEmptyCell(arr, l):
            return True
        
        row = l[0]
        col = l[1]

        arrPredict = predict[col + (row*9)]

        for _ in range(len(arrPredict)):
            num =  np.argmax(arrPredict) + 1
            if arrPredict[num-1] >= 0.95:
                arr[row][col] = num
            
                if solveSudoku(arr):
                    return True
                
                arr[row][col] = 0

            elif checkLocationIsSafe(arr, row, col, num):
                arr[row][col] = num
            
                if solveSudoku(arr):
                    return True
                
                arr[row][col] = 0
            arrPredict[num-1] = 0
        
        return False

    if predict is None:
        if solveSudoku(quiz): return quiz
        else: return None
        hola= 1
    else:
        if solveSudokuIA(quiz): return quiz
        else: return None

class Sudoku(APIView):
    def post(self, request):
        quiz = request.data.get('quiz', None)
        byIA = request.data.get('byIA', None)
        if quiz is None:
            return Response({'error': 'No se encontró la clave "quiz" en los datos de la solicitud'}, status=status.HTTP_400_BAD_REQUEST)
        
        if byIA is None:
            return Response({'error': 'No se encontró la clave "byIA" en los datos de la solicitud'}, status=status.HTTP_400_BAD_REQUEST)
        
        quiz = list(map(int, list(quiz)))
        quiz = np.array(quiz).reshape((9,9))
        solution =  None

        if byIA: 
            quizModel = (np.array(quiz).reshape(9,9,1)/9) - 0.5
            predict = model.predict(quizModel.reshape(1,9,9,1)).squeeze()
            solution = solveSudokuBacktracking(quiz, predict)
        else: 
            solution = solveSudokuBacktracking(quiz,None)
        
        logging.debug(solution)
        res = {'solution': solution}
        return Response(res, status=status.HTTP_200_OK)