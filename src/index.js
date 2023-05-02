import "./index.css";
import * as d3 from "d3";
class Node {
  constructor(value) {
    this.value = value;
    this.parent = null;
    this.left = null;
    this.right = null;
  }
}

class BinaryTree {
  constructor(node) {
    this.root = node;
  }

  // randomInsert(node, root = this.root) {
  //   if (!root) {
  //     // if tree is empty, make node the root
  //     this.root = node;
  //     return;
  //   }

  //   if (root.left == null) {
  //     root.left = node;
  //     node.parent = root;
  //   } else if (root.right == null) {
  //     root.right = node;
  //     node.parent = root;
  //   } else {
  //     // recursively insert node in left or right subtree
  //     if (Math.random() < 0.5) {
  //       this.insert(node, root.left);
  //     } else {
  //       this.insert(node, root.right);
  //     }
  //   }
  // }

  // Insert in Complete binary tree format.
  insert(node) {
    // If the root is empty, make the node the root.
    if (!this.root) {
      this.root = node;
      return;
    }

    // Create a queue to keep track of nodes.
    let queue = [this.root];

    // While the queue is not empty, keep traversing the tree level by level.
    while (queue.length > 0) {
      // Dequeue the first node from the queue.
      let currNode = queue.shift();

      // If the left child of the current node is null, insert the new node as its left child.
      if (currNode.left === null) {
        currNode.left = node;
        node.parent = currNode;
        return;
      }
      // Else, if the right child of the current node is null, insert the new node as its right child.
      else if (currNode.right === null) {
        currNode.right = node;
        node.parent = currNode;
        return;
      }
      // Else, both the left and right children of the current node exist.
      // Enqueue the left and right children of the current node to process them later.
      else {
        queue.push(currNode.left);
        queue.push(currNode.right);
      }
    }
  }

  clear() {
    this.root = null;
  }
}

// Main Program
function creatBinaryTree(values) {
  let numbers = [...values];

  let tree = new BinaryTree();

  for (i in numbers) {
    tree.insert(new Node(numbers[i]), tree.root);
  }

  // Set dimensions and margins for diagram
  let margin = { top: 15, bottom: 0 },
    width = 400,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the container of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  let svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", "0 0 600 600")
    .append("g")
    .attr("transform", "translate(0," + margin.top + ")");

  let i = 0,
    duration = 750,
    root;

  // Declares a tree layout and assigns the size
  let treemap = d3.tree().size([width, height]);

  // Assigns parent, children, height, depth, and coordinates

  root = d3.hierarchy(tree.root, function (d) {
    d.children = [];
    if (d.left) {
      d.children.push(d.left);
    }
    if (d.right) {
      d.children.push(d.right);
    }
    return d.children;
  });

  root.x0 = width / 2;
  root.y0 = 0;

  update(root);

  // Update
  function update(source) {
    // Assigns the x and y position for the nodes
    let treeData = treemap(root);

    // Compute the new tree layout.
    let nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

    // Normalize for fixed-depth
    nodes.forEach(function (d) {
      d.y = d.depth * 100;
    });

    // **************** Nodes Section ****************

    // Update the nodes...
    let node = svg.selectAll("g.node").data(nodes, function (d) {
      return d.id || (d.id = ++i);
    });

    // Enter any new nodes at the parent's previous position.
    let nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function (d) {
        return "translate(" + source.x0 + "," + source.y0 + ")";
      })
      .on("click", onClickNode);

    // Add Circle for the nodes
    nodeEnter
      .append("circle")
      .attr("class", function (d) {
        if (isNaN(d.value)) {
          return "node ";
        }
        return "node";
      })
      .attr("r", 40)
      .style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
      });

    // Add labels for the nodes
    nodeEnter
      .append("text")
      .attr("dy", ".05em")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .text(function (d) {
        return d.data.value;
      });

    // Update
    let nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the nodes
    nodeUpdate
      .transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    // Update the node attributes and style
    nodeUpdate
      .select("circle.node")
      .attr("r", 10)
      .style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
      })
      .attr("cursor", "pointer");

    // Remove any exiting nodes
    let nodeExit = node
      .exit()
      .transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + source.x + "," + source.y + ")";
      })
      .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select("circle").attr("r", 1e-6);

    // On exit reduce the opacity of text lables
    nodeExit.select("text").style("fill-opacity", 1e-6);

    // **************** Links Section ****************

    // Update the links...
    let link = svg
      .selectAll("path.link")

      .data(links, function (d) {
        return d.id;
      });

    // Enter any new links at the parent's previous position
    let linkEnter = link
      .enter()
      .insert("path", "g")
      .attr("class", function (d) {
        if (isNaN(d.value)) {
          return "link  ";
        }
        return "link";
      })
      .attr("d", function (d) {
        let o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      });

    // Update
    let linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate
      .transition()
      .duration(duration)

      .attr("d", function (d) {
        return diagonal(d, d.parent);
      });

    // Remove any existing links
    link
      .exit()
      .transition()
      .duration(duration)
      .attr("d", function (d) {
        let o = { x: source.x, y: source.y };
      })
      .remove();

    // Store the old positions for transition.
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Create a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
      let path = `M ${s.x} ${s.y}
            C ${(s.x + d.x) / 2} ${s.y},
              ${(s.x + d.x) / 2} ${d.y},
              ${d.x} ${d.y}`;

      return path;
    }

    // Initialize previously clicked node as null
    let prevNode = null;

    function onClickNode(_, d) {
      // If there was a previously clicked node, reset its color and the edge colors
      if (prevNode) {
        // Reset node colors
        svg.selectAll("g.node").select("circle").style("fill", null);

        // Reset edge colors
        svg
          .selectAll("path.link")

          .style("stroke", null);
      }

      // Change the color of clicked node
      d3.select(this).select("circle").style("fill", "orange");

      // Change the color of all parent nodes
      let ancestors = [];
      let current = d;
      while (current.parent) {
        ancestors.unshift(current);
        current = current.parent;
      }
      ancestors.unshift(current);

      svg
        .selectAll("g.node")
        .filter(function (node) {
          return ancestors.indexOf(node) !== -1;
        })
        .select("circle")
        .style("fill", "orange");

      // Change the color of all edges connecting clicked node and root
      let path = [d];
      while (path[0].parent) {
        path.unshift(path[0].parent);
      }

      svg
        .selectAll("path.link")
        .filter(function (link) {
          return path.indexOf(link) !== -1;
        })
        .style("stroke", "blue");

      // Set the previously clicked node to the current node
      prevNode = d;
    }
  }
}

/**
 * The function clears all child elements from a given parent element.
 * @param element - The parameter "element" is a reference to an HTML element that we want to clear of
 * all its child elements. The function "clearElement" uses a while loop to remove all child elements
 * of the given element until there are no more child elements left.
 */
function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

const onSubmit = () => {
  const value = d3?.select("#binarytreeinputs")?.property("value");
  if (value) {
    // get DOM element to display the tree
    //let treeContainer = document.getElementById("d3-container");
    // clear previous tree from DOM element
    // if (treeContainer) {
    //   clearElement(treeContainer);
    // }

    let treeContainer = d3.select("#d3-container");
    if (!treeContainer.empty()) {
      treeContainer.selectAll("*").remove();
    }

    creatBinaryTree(value?.split(",")?.filter((e) => e));
  } else {
    alert("Enter some value");
  }
};

document?.getElementById("submit")?.addEventListener("click", onSubmit);
