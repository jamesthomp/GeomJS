define plotMandel(w, x0, y0, s) =
  let black = [0, 0, 0] in
  let forever = 1000 in
  let mandle(cx, cy) =
    let loop(n, x, y) =
      if n >= forever then -1
      else if x*x + y*y > 4 then n
      else loop(n+1, x*x - y*y + cx, 2*x*y + cy) in
    let m = loop(0, 0, 0) in
    if m < 0 then black else [m/forever, 0.7, 1] in
  let adjusted(x,y) = mandle(x0 + s*(x/w-0.5), y0 + s*(y/w-0.5)) in
  image(w, w{*14.1/18.9}, adjusted, "mandle");
  
define test() = plotMandel(45, -1, 0.285, 0.02);
test()