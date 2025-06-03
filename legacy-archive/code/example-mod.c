#include <stdio.h>

extern void vulnerable(int i, char *buf);

int main(int argc, char *argv[]) {
    char buf[256];
    size_t x = 0;
    scanf("%lu", &x);
    vulnerable(x, buf);
    return 0;
}
