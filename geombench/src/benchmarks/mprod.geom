define mprod([],[]) = 0
     | mprod(x:xs,y:ys) = (x*y)+mprod(xs,ys);

define range(a, b) =
    let main(b, acc) = if a > b then acc else main(b-1, b:acc) in
    main(b, []);

define test() = [ mprod(range(100,1400+i),range(100-i,1400)) | i <- range(1,75)];
test();
test();
test();
test();