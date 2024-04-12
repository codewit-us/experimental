# Experimental
## Getting Started
Navigate to the `codeExecutor` directory, run the application, and build the Docker image:

```bash
cd codeExecutor
```
```bash
npm run dev
```
```bash
docker build -t codewitus-python -f code_files/Dockerfile.python.box code_files/
```

## Testing the application:
At present, the Docker image is not stored in a Docker registry. Therefore, depending on your Docker timeout configurations, you may need to log in and build the image for each session.

### Building image:
```bash
docker build  -t codewitus-python -f code_files/Dockerfile.python.box code_files/.
```

### code that passes all test cases:

```python
class GradeBook:
   def __init__(self):
       self.grades=[]

   def get_average(self):
       if not self.grades:
           return 0
       return sum(self.grades)/float(len(self.grades))
  
   def add_grade(self,grade):
       self.grades.append(grade)
```

## Contributing

See the [contributing guide](https://github.com/codewit-us/codewit.us/blob/main/CONTRIBUTING.md).
