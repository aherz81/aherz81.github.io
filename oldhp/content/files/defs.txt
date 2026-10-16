#ifndef __DEFS__
#define __DEFS__

#define MY_PI 3.14

struct test
{
	DWORD dd;
	char* nn;
	test* ttt;
};

__cdecl void printf(char*c,?);	//the only extern function available in the VM

#endif