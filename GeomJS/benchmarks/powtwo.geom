define powtwo(x) = 1 when x = 0
     | powtwo(x) = "powtwo expects number >= 0" when numeric(x) and x < 0
     | powtwo(x) = powtwo(x-1) + powtwo(x-1) when numeric(x)
     | powtwo(x) = "powtwo expects a number";

define test() = powtwo(24);
test();