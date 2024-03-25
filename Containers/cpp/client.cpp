#include <iostream>
#include <vector>

using namespace std;

int main(int argc, char *argv[]) {
    if (argc < 3) {
        cout << "Please provide at least two arguments." << endl;
        return 1;
    }
    vector<string> args(argv + 1, argv + argc);
    for (int i = 0; i < args.size(); ++i) {
        cout << "Argument " << i + 1 << ": " << args[i] << endl;
    }
    return 0;
}