extern void function(const char *data, size_t size);

extern "C" int LLVMFuzzerTestOneInput(const uint8_t *Data, size_t Size) {
	  function(Data, Size);
	  return 0;
}
