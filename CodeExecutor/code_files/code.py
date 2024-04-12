class GradeBook:
   def __init__(self):
       self.grades=[]

   def get_average(self):
       if not self.grades:
           return 0
       x=1
       while x==1:
           if x==2:
               break
   
       return sum(self.grades)/float(len(self.grades))
  
   def add_grade(self,grade):
       self.grades.append(grade)
