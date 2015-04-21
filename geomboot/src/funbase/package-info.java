package funbase;

/*
class Value.FunValue
	Every value (whether a function value or not) has an instance variable
	subr of type Function that determines what happens when the value is
	applied.  For non-function values, this subr has class Function, and
	just prints an error message.

class Function
	An object that can be applied to arguments.  Subclasses include
	Primitive (for primitives) and Function.Closure (for user functions), 
	with its subclasses Interp.InterpFunction and JitFunction.
	
class Function.Closure
	A pair consisting of a FunCode object and an array of values for
	free variables in it.  Instances of Function.Closure are used only
	for serialization; all objects in a running program belong to
	one of the subclasses InterpFunction or JitFunction and implement
	the apply method appropriately.

interface Function.Factory
	Represents a lambda in the GeomLab program. Provides a method 
	newClosure that takes a vector of values for free variables and 
	returns a Function.  Implemented by an anonymous class inside
	Interp.translate and by JitFunction

class Funcode
	Postfix code for a function body.

interface Funcode.Jit
	Provides a method translate that can convert a Funcode object into
	an instance of Function.Factory.  Implemented by Interp and by
	JitTranslator.

class Interp
	An implementation of Funcode.Jit where translate returns a
	factory that simply builds InterpFunction objects.

class Interp.InterpFunction
	A subclass of Closure that implements apply using an interpreter
	for the funcode.

class JitTranslator
	An implementation of Funcode.Jit that implements translate by
	dynamically generating a JitFunction subclass with an appropriate
	apply method.  The Function.Factory object that is returned is
	actually a prototype JitFunction object that makes closures by
	cloning itself.

class JitFunction
	Superclass for all dynamically generated functions.  A subclass of
	Function.Closure that implements apply in a way specific to each
	function.  It also implements Function.Factory with a newClosure
	method that clones the JitFunction object and installs the
	given array of free variables.

The apply method by which functions are called actually consists of a
general apply method that takes its arguments in an array, together with
four specific methods apply0 ... apply3 that take from zero to three
explicit arguments.  These methods are implemented in various places:

* in Function, apply0..3 are implemented to call the general apply method,
  and the general apply method is implemented by printing a message about
  calling a non-function.
  
* in InterpFunction, the general apply method is overridden by a definition
  that interprets the bytecode.  This definition calls other functions using
  the general apply method, so within the interpreter only this method is used.
  
* each dynamic subclass of JitFunction is typically defined by extending one
  of its subclasses JitFunction.Func<n>.  Each of these redefines the
  general apply method to check the number of arguments then call apply<n>,
  and also makes apply<n> abstract, to be overridden in the dynamic subclass
  with code that does the actual work.  The methods apply<m> for m != n are
  left with their definitions from Function, so that they construct an array
  and call the general apply method, which will inevitably issue an error
  message.
  
* similarly, primitives are typically defined by creating a subclass of
  Primitive.Prim<n>; in this superclass, apply<n> is overridden so it calls
  an abstract method invoke<n>, and that method is defined in each subclass
  to do the work of the primitive.  Primitives are called from the interpreter
  using the general apply method, which unpacks the arguments and calls
  apply<n>; they are also invoked from dynamically generated code using
  the apply<n> method directly.
*/