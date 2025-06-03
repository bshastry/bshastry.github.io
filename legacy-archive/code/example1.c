#include <stdio.h>

void vulnerable(int y, char *buf) {
   buf[y] = '0';
}

int main(int argc, char *argv[]) {
   char buf[256];
   size_t x = 0;
   scanf("%lu", &x);
   vulnerable(x, buf);
   return 0;
}
