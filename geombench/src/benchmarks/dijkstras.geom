{ A rather cryptic implementation of dijkstras algorithm that given 
 an adjacency list will compute the shortest distance from the first
 to the last vertex. So given
 graph = [v0,v1,v2] where
 v0 = [0,2,-1]
 v1 = [2,0,3]
 v2 = [-1,3,0]
 it will return [[0, 1, 2], 5] meaning the shortest path from v0 to v2
 is to go v0->v1->v2 with cost 5.
}
define dijkstras(graph) =
  let elemat(0,x:xs) = x
    | elemat(i,[]) = _error("elemat: out of array bounds")
    | elemat(i,x:xs) = elemat(i-1,xs) in
  let zip(x:xs,y:ys) = [x,y]:(zip(xs,ys))
    | zip([],[]) = [] in
  let last([x]) = x
     |last(x:xs) = last(xs) in
  let middle([a,b,c,d]) = [b,c] in
    
  let len = length(graph) in
  let nextindex(bestdistance) =
    head(
      foldr(
      function([i,p,c,d],[i2,p2,c2,d2]) if d = 0 and (c2 = -1 or c < c2) then [i,p,c,d] else [i2,p2,c2,d2],
      [-1,[],-1,-1], bestdistance)) in
  let done([i,p,c,d]) = d = 1 in
  let update(bestdistance,n) =
     let adjToN = elemat(n,graph) in
     let rowN = elemat(n,bestdistance) in
     let pathToN = elemat(1,rowN) in
     let distToN = elemat(2,rowN) in
     map(
       function([[i,p,c,d],c2]) if (c2 <> -1) and (c = -1 or distToN + c2 < c) then [i,pathToN ++ [i],distToN + c2,d] else [i,p,c, if i = n then 1 else d],
       zip(bestdistance,adjToN)) in
  let continue(bestdistance) =
    let goal = last(bestdistance) in 
    if done(goal) then goal
    else
      (let n = nextindex(bestdistance) in
      continue(update(bestdistance,n))) in
  
  let initbestdistance = [0,[0],0,0]:[[e,[],-1,0] | e <- [1..(len-1)]] in
  if len = 0 then [] else middle(continue(initbestdistance));

define range(a, b) =
    let main(b, acc) = if a > b then acc else main(b-1, b:acc) in
    main(b, []);

define test() = [
dijkstras([
[0,1,2,-1,-1,-1,-1,-1,-1,-1,-1,-1],
[1,0,i,3,2,-1,-1,-1,-1,-1,-1,-1],
[2,1,0,1,2,-1,-1,-1,-1,-1,-1,-1],
[-1,3,1,0,4,3,-1,-1,-1,-1,-1,-1],
[-1,2,3,4,0,3,-1,-1,-1,-1,-1,-1],
[-1,-1,-1,3,3,0,1,-1,-1,-1,-1,-1],
[-1,-1,-1,1,1,0,1,1,2,-1,-1,-1],
[-1,-1,-1,1,1,1,1,0,1,3,2,-1],
[-1,-1,-1,1,1,1,2,1,0,1,2,-1],
[1,1,1,1,1,1,1,3,1,0,4,-1],
[1,1,1,1,1,1,1,2,3,4,0,1],
[1,1,1,1,1,1,1,1,1,3,3,0]
]) | i <- range(0,100)];

test();
test();