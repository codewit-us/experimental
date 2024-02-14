import os

def main():
    args = os.environ.get('ARGS')
    if args:
        args_list = args.split(',')
        for i, arg in enumerate(args_list, start=1):
            print(f"Argument {i}: {arg}")
    else:
        print("Please provide values for the ARGS environment variable.")

if __name__ == "__main__":
    main()
