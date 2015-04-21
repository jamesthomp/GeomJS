define lastpat([x]) = x
     | lastpat([_,x]) = x
     | lastpat([_,_,x]) = x
     | lastpat([_,_,_,x]) = x
     | lastpat([_,_,_,_,x]) = x
     | lastpat(_:_:_:_:x) = lastpat(x);

define range(a, b) =
    let main(b, acc) = if a > b then acc else main(b-1, b:acc) in
    main(b, []);

define test() = [ lastpat(range(0,3900+i)) | i <- range(0,100)];

test();
test();