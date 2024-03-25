class GradeBook:
   def __init__(self):
       self.grades=[]

   def get_average(self):
       if not self.grades:
           return 0
   
       return sum(self.grades)/float(len(self.grades))
  
   def add_grade(self,grade):
       self.grades.append(grade)