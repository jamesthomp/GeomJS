define reverse(xs) =
  let reva([], vs) = vs
    | reva(u:us, vs) = reva(us, u:vs) in
  reva(xs, []);
     
define range(a, b) =
    let main(b, acc) = if a > b then acc else main(b-1, b:acc) in
    main(b, []);

define test() = [ reverse(range(0,2000+i)) | i <- range(0,50)];
test();