#define true 1
#define false 0
typedef int bool;

typedef struct node{
    int data;
    node * next;
} node;

void union_ (node * A, node * B, node * C);
void intersect (node * A, node * B, node * C);
void difference (node * A, node * B, node * C);
void symmetricdiff (node * A, node * B, node * C);
bool belongsto (node * A, int x);
void add (node * A, int x);
bool issubset (node * A, node * B); // <--
bool equals (node * A, node * B); // 
void setdisplay (node * A);

bool issubset (node * A, node * B) {
    for (node * first = A; first ->next != NULL; first = first ->next) {
        if ( ! belongsto (B, first ->data) )
            return false;
    }
    return true;
}
bool equals (node * A, node * B) {
    return issubset (A, B) && issubset (B, A);
}


//also, you used bad naming conventions
// NamesLikeThis are used for classes <-- dont use this for functions
// NAMESLIKETHIS are used for constants
// nameLikeThis are used for variables, functions

// like what im trying to say is, it doesnt give you so much if you clean up after,
// but if you maintain good style throughout, you find you can write code faster and less error prone

// trying to clean up after doesnt work for big projects
// thats all, just try to remember that