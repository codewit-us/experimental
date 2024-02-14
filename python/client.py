import os 
def main():
    arg1 = os.environ.get('ARG1')
    arg2 = os.environ.get('ARG2')

    if arg1 and arg2:
        print("Argument 1:", arg1)
        print("Argument 2:", arg2)
    else:
        print("Please provide values for ARG1 and ARG2 environment variables.")
if __name__ == "__main__":
    main()
