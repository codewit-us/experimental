# Experimental
This repository is dedicated to the development of experimental features, specifically focusing on creating a coding platform capable of executing user-submitted code and running test cases against it.

## Getting Started
Navigate to the `codeExecutor` directory, run the application:

```bash
cd codeExecutor
```
```bash
npm run dev
```

## Testing the application:
At present, the Docker image is not stored in a Docker registry. Therefore, depending on your Docker timeout configurations, you may need to log in and build the image for each session.

### Building image:
```bash
docker build  -t codewitus-python -f code_files/Dockerfile.python.box code_files/.
```


### Code that passes all test cases:
Copy and paste the following code inside the box and submit the code. 

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
## Running Container Restrictions: 
The subprocess launches the container Dockerfile.python.box where the user submitted code is being run. The container running time is limited to 4 seconds. This is achieved through the following line in the dockerfile:<br />

```CMD ["timeout", "4s", "python", "testfile.py"]``` 
Memory usage for the container is capped at 300 MB, and security privileges are restricted. These constraints are implemented using the docker run command in index.ts:

 ```typescript
const command = `docker run --memory 300m --network none --security-opt=no-new-privileges -v "$(pwd)/code_files/code.py":/usr/src/code.py -v "$(pwd)/code_files/test-reports":/usr/src/test-reports codewitus-python`;
```

**--memory 300m:** Enforces a memory limit of 300 MB for the container.<br/>
**--network none:** Disables networking for the container, preventing external network access.<br/>
**--security-opt=no-new-privileges:** Prevents any process within the container from gaining additional privileges beyond those it initially started with. This option enhances security by limiting the attack surface, especially when executing untrusted or potentially risky code.

## Contributing

See the [contributing guide](https://github.com/codewit-us/codewit.us/blob/main/CONTRIBUTING.md).