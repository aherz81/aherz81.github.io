#pragma enable binary		//must be enabled
#pragma enable debug_info	//line info
#pragma disable symbols		//if enabled the symbol recognition is logged
/*
test source file for svc...
(c) by Alex 11.10.99 :)
#pragmas have to be at the beginning of the source file
*/
#define _ALLIGN DWORD			//alligns structs..all standart data types are possible		
//#define HOLD_ON_ERRORS		//make compiler stop as soon he reaches an error
//#define DISABLE_ERROR_C308448		//disable a certain error(force code output)
//#define NO_SYMBOL_CHECK		//stops the compiler from checking symbols

#include "defs.h"

DWORD d=0;
test mtest;					//struct defined in 'defs.h'

__cdecl void ftest(char*c,DWORD md)
{
	printf(c,md);
}

__cdecl DWORD Test()				//the VM will execute the function specified as arg1..if you use test.bat it will be this 
{
	ftest("|test %d==10|",10);
	__asm					//asm is a bit special
	{					//carefully here..asm will not be syntax checked
		mov reg2,2.5			//one of the nice things..you put floats..
		fadd reg2,2.5
		ftodw reg2			//convert the content of reg2 from float do dword
		mov [d],reg2			//d=adress of d..
	}

	mtest.dd=d+MY_PI;			//this will create some convert warnings as MY_PI is a float
	mtest.nn="|hallo:%d 0x%x|";

	printf(mtest.nn,mtest.dd,&mtest);	

	return 1;

}