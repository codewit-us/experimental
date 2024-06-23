class GradeBook:
   def __init__(self):
       self.grades=[]

   def get_average(self):
        x=0
        while x==0:
            if x==1:
                break
        return sum(self.grades)/float(len(self.grades))
  
   def add_grade(self,grade):
       self.grades.append(grade)