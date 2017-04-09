#define true 1
#define false 0
typedef int bool;

typedef struct node{
    int data;
    struct node *link;
} node;

void add (node * * head_ref, int data);
void remove_ (node * * head_ref, int data);

node * union_ (node * head1, node * head2);
node * intersection (node * head1, node *head2);
node * difference(node *head1, node *head2);
node * difference(node * head1, node * head2);
node * symmetricdiff (node *head1, node *head2);
bool belongsto (node * head, int key);
bool issubset (node *head1, node *head2);
bool equals (node * head1, node * head2);
void setdisplay (node * node);


void add (node * * head_ref, int new_data) {
    if ( ! belongsto (* head_ref, new_data) ) {
        node * new_node = (node *) malloc (sizeof (node));
        new_node->data = new_data;
        new_node->link = *head_ref;
        *head_ref = new_node;
    }
}
/*void remove_ (node * * head_ref, int data) {
    if ( * head_ref != NULL ) {
        if ((* head_ref)->data == data) {
            * head_ref = (* head_ref) ->link;
        }
        else {
            remove_ (& ((* head_ref) ->link), data);
        }
    }
}*/



node * union_ (node * head1, node * head2) { 
    node * result = NULL;

    while (head1 != NULL) {
        add (& result, head1->data);
        head1 = head1->link;
    }
    while (head2 != NULL) {
        add (& result, head2->data);
        head2 = head2->link;
    }

    return result;
}
node * intersection (node * head1, node *head2) {
    node * result = NULL;
    
    while (head1 != NULL) {
        if (belongsto(head2, head1->data))
            add(&result, head1->data);
        head1 = head1->link;
    }
    return result;
}
node * difference(node * head1, node * head2) {

    node *result = NULL;

    while (head1 != NULL) {
        if (! belongsto (head2, head1->data) )
            add(&result, head1->data);
        head1 = head1->link;
    }

    return result;
}
node * symmetricdiff(node *head1, node *head2){
    return difference ( union_ (head1, head2), intersection (head1, head2) );
}

bool belongsto(node * head, int key) {
    while (head != NULL) {
        if (head->data == key) {
            return true;
        }
        head = head->link;
    }
    return false;
}
bool issubset (node *head1, node *head2) {
    while (head2->link != NULL) {
        if ( !belongsto (head1, head2->data))
            return false;
        head2 = head2->link;
    }
    return true;
}
bool equals (node * head1, node * head2) {
    return issubset (head1, head2) && issubset (head2, head1);
}

void setdisplay (node * node) {
    while (node != NULL) {
        printf ("%d ", node->data);
        node = node->link;
    }
}