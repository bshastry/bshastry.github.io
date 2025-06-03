#include <string.h>
#include <stdlib.h>

void function(const char *in, size_t size) {
	if (!strcmp(in, "doom"))
		abort();
}
