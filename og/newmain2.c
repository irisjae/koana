#include"revised2.h"
// see belongsto
/* Driver program to test above function*/
int main()
{
    int operation; int x;

    /* Start with the empty list */
    struct node* head1 = NULL;
    struct node* head2 = NULL;
    struct node* intersecn = NULL;
    struct node* unin = NULL;
    struct node* diff = NULL;
    struct node* symmdiff= NULL;
    int iss; int eq;

    //create a linked lits 10->15->5->20
    add (&head1, 23);
    add (&head1, 11);
    add (&head1, 96);
    add (&head1, 10);

    //create a linked lits 8->4->2->10
    add (&head2, 11);
    add (&head2, 16);
    add (&head2, 3);
    add (&head2, 10);

    intersecn = Intersection (head1, head2);

    unin = Union (head1, head2);

    diff= Difference(head1, head2);

    symmdiff = Symmetricdiff(head1, head2);

    iss = issubset(head1, head2);

    eq = equals(head1, head2);


    do{
        printf("Select an operation:\n");
        printf("1. Display elements in set A and B\n");
        printf("2. Intersection of set A and B\n");
        printf("3. Union of set A and B\n");
        printf("4. Check if an element belongs to A\n");
        printf("5. Difference of set A and B\n");
        printf("6. Symmetric Difference of set A / B\n");
        printf("7. Check if set A is a subset of B\n");
        printf("8. Check if set A equals to B\n");
        printf("9. Exit\n");
        scanf("%d", &operation);


    switch(operation){

        case 1:
            printf ("\n Elements in set A: \n");
            setdisplay (head1);
            printf ("\n Elements in set B: \n");
            setdisplay (head2);
            printf("\n\n");
            break;
        case 2:
            printf ("\n Intersection of set A∩B: \n");
            setdisplay (intersecn);
            printf("\n\n");
            break;
        case 3:
            printf ("\n Union of set A∪B: \n");
            setdisplay (unin);
            printf("\n\n");
            break;
        case 4:
            printf("\n Enter an element to check \n");

            scanf ("%d", &x);
            if ( belongsto(head1, x) )
                printf ("True");
            else
                printf ("False");
            printf("\n");
            break;
        case 5:
            printf ("\n Difference in set A∩B: \n");
            setdisplay (diff);
            printf("\n\n");
            break;
        case 6:
            printf("\n Symmetric difference in set AΔB: \n");
            setdisplay (symmdiff);
            printf("\n\n");
            break;
        case 7:
            printf("\n Checking if A is a subset of B...\n");
            if ( issubset (head1, head2) )
                printf ("True");
            else
                printf ("False");
            printf("\n");
            break;
        case 8:
            printf("\n Checking if A is equal to B...\n");
            if ( equals(head1, head2) )
                printf ("True");
            else
                printf ("False");
            printf("\n");
            break;
        default:
            printf ("\n");
            return 0;
    }
    } while (operation != 9);
    getchar();
    }
