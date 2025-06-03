#include <string.h>
#include <crypt.h>
#include <stdlib.h>
#include <unistd.h>
#define CUSTOM() abort ()
void fuzzable ( const char * input ) {
	// F u z z e r finds this bug
	if (!strcmp(input , "doom" ))
		abort();
}
void cov_bottleneck(const char *input) {
	char *hash = crypt(input, "salt");
	
	// Fuzzer is unlikely to find this bug
	if (!strcmp(hash, "hash_val"))
		CUSTOM(); // grep misses this
}

// F u z z e r test h a r n e s s
// INPUT : stdin
int main () {
  char buf [256];
  memset ( buf , 0, 256);
  read (0 , buf , 255);
  fuzzable ( buf );
  cov_bottleneck(buf);
  return 0;
}
