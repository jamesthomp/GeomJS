define qsort([]) = []
     | qsort(x:xs) = qsort(filter(function(e) e<=x, xs)) ++ [x] ++ qsort(filter(function(e) e>x, xs));

define range(a, b) =
    let main(b, acc) = if a > b then acc else main(b-1, b:acc) in
    main(b, []);

define test() = qsort(range(0,500) ++ reverse(range(0,600)));
test();