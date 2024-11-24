import React from "react";

// force build
export function add(a: number, b: number): number {
    const asd = React.createElement("div", null, "Hello");
    console.log(asd);
    return (a + b) * 2;
}
