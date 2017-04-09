#include <stdio.h>
#include <stdlib.h>
#include "revised1.h"

int main() {
    
    node* head1 = NULL;
    node* head2 = NULL;

    add (&head1, 20);
    add (&head1, 4);
    add (&head1, 15);
    add (&head1, 10);

    add (&head2, 8);
    add (&head2, 4);
    add (&head2, 2);
    add (&head2, 10);

    int operation;
    do {
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

        switch(operation) {
    
            case 1:
                printf ("\nElements in set A: \n");
                setdisplay (head1);
                printf ("\nElements in set B: \n");
                setdisplay (head2);
                printf("\n\n");
                break;
            case 2:
                printf ("\nIntersection of set A∩B: \n");
                setdisplay (intersection (head1, head2));
                printf("\n\n");
                break;
            case 3:
                printf ("\nUnion of set A∪B: \n");
                setdisplay (union_ (head1, head2));
                printf("\n\n");
                break;
            case 4:
                printf("\nEnter an element to check \n");
                int x;
                scanf ("%d", &x);
                if ( belongsto (head1, x) )
                    printf ("True");
                else
                    printf ("False");
                printf("\n");
                break;
            case 5:
                printf ("\nDifference of set A with set B: \n");
                setdisplay (difference (head1, head2));
                printf("\n\n");
                break;
            case 6:
                printf("\nSymmetric difference of set A with set B: \n");
                setdisplay (symmetricdiff (head1, head2));
                printf("\n\n");
                break;
            case 7:
                printf("\nChecking if A is a subset of B...\n");
                if ( issubset (head1, head2) )
                    printf ("True");
                else
                    printf ("False");
                printf("\n");
                break;
            case 8:
                printf("\nChecking if A is equal to B...\n");
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
}
