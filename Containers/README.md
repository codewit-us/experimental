# Build an image:
### Python : docker build -t codewitus-python -f Dockerfile.python.box .
### java : docker build -t codewitus-java -f Dockerfile.java.box .
### cpp: docker build -t codewitus-cpp -f Dockerfile.cpp.box .  

# Run a Docker image :
### Python: docker run -e ARGS="Hello,Python,World" codewitus-python
### Java: docker run codewitus-java Hello java World 
### cpp: docker run codewitus-cpp Hello cpp world 



