public class Client {
    public static void main(String[] args) {
        if (args.length >= 2) {
            for(int i=0;i<args.length;i++){
                String arg = args[i];
                System.out.println("Argument "+(i+1)+" : " + arg);
            }
        } else {
            System.out.println("Hi,Please provide two arguments.");
        }
    }
}
