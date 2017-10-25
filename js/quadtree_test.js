window.addEventListener("load", function () {
  test();
});

let quadtree_tests = 0,
  quadtree_test_successes = 0,
  quadtree_test_failures = 0;

function test () {
  let map = {
    width: 400, height: 400,
    layers: [
      [
        { x: 10, y: 10, id: 'one', },
        { x: 390, y: 10, id: 'two', },
      ],
      [
      ],
      [
        { x: 10, y: 390, id: 'three', },
        { x: 210, y: 210, id: 'four', },
        { x: 200, y: 200, id: 'five', },
        { x: 210, y: 210, id: 'samesies' },
      ]
    ]
  };

  let quadtree = map_to_quadtree(map, 25),
    entity_count = 6;

  // tests begin!
  // get_by_range
  console.log("get by range:");
  console.log("");

  // full range gets all the things
  console.log("  full range gets all the things");
  assert_eq(entity_count, quadtree_get_by_range(quadtree, 0, 0, 400, 400).length);
  // beyond full range still just gets all the things
  console.log("  beyond full range still just gets all the things");
  assert_eq(entity_count, quadtree_get_by_range(quadtree, -4000, -4000, 500, 600).length);
  // out of bounds doesn't just always get all the things
  console.log("  out of bounds doesn't just always get all the things");
  assert_eq(1, quadtree_get_by_range(quadtree, -300, -123, 10, 10).length);
  assert_eq(1, quadtree_get_by_range(quadtree, -300, -123, 11, 11).length);
  // out of bounds range gets the right thing
  console.log("  out of bounds range gets the right thing");
  assert_eq("one", quadtree_get_by_range(quadtree, -300, -123, 10, 10)[0].id);
  assert_eq("one", quadtree_get_by_range(quadtree, -300, -123, 11, 11)[0].id);
  // a limited range gets the right number of things and the right thing
  console.log("  a limited range gets the right number of things and the right thing");
  assert_eq(1, quadtree_get_by_range(quadtree, 0, 0, 15, 15).length);
  assert_eq("one", quadtree_get_by_range(quadtree, 0, 0, 15, 15)[0].id);
  // a limited range gets the right things when there is more than one thing
  console.log("  a limited range gets the right things when there is more than one thing");
  assert_eq(2, quadtree_get_by_range(quadtree, 9, 9, 391, 11).length);
  assert_eq("two", quadtree_get_by_range(quadtree, 9, 9, 391, 11)[0].id);
  assert_eq("one", quadtree_get_by_range(quadtree, 9, 9, 391, 11)[1].id);
  // a limited range gets the right things when two things have same coords
  console.log("  a limited range gets the right things when two things have same coords");
  assert_eq(2, quadtree_get_by_range(quadtree, 209, 209, 211, 211).length);
  assert_eq("four", quadtree_get_by_range(quadtree, 209, 209, 211, 211)[0].id);
  assert_eq("samesies", quadtree_get_by_range(quadtree, 209, 209, 211, 211)[1].id);
  // the exact coords of a thing as upper and lower bounds gets just the right thing
  console.log("  the exact coords of a thing as upper and lower bounds gets just the right thing");
  assert_eq(1, quadtree_get_by_range(quadtree, 10, 10, 10, 10).length);
  assert_eq("one", quadtree_get_by_range(quadtree, 10, 10, 10, 10)[0].id);
  // the exact coords within epsilon of a thing as upper and lower bounds gets just the right thing
  console.log("  the exact coords within epsilon of a thing as upper and lower bounds gets just the right thing");
  assert_eq(1, quadtree_get_by_range(quadtree, 10.001, 9.999, 10.001, 9.999).length);
  assert_eq("one", quadtree_get_by_range(quadtree, 10.001, 9.999, 10.001, 9.999)[0].id);
  // exact coords gets the right things when the two things have same coords
  console.log("  exact coords gets the right things when the two things have same coords");
  assert_eq(2, quadtree_get_by_range(quadtree, 210, 210, 210, 210).length);
  assert_eq("four", quadtree_get_by_range(quadtree, 210, 210, 210, 210)[0].id);
  assert_eq("samesies", quadtree_get_by_range(quadtree, 210, 210, 210, 210)[1].id);
  // exact coords within epsilon gets the right things when the two things have same coords
  console.log("  exact coords within epsilon gets the right things when the two things have same coords");
  assert_eq(2, quadtree_get_by_range(quadtree, 210.001, 210.001, 210.001, 210.001).length);
  assert_eq("four", quadtree_get_by_range(quadtree, 210.001, 210.001, 210.001, 210.001)[0].id);
  assert_eq("samesies", quadtree_get_by_range(quadtree, 210.001, 210.001, 210.001, 210.001)[1].id);
  // ranges work with the larger x,y first
  console.log("  ranges work with the larger x,y first");
  assert_eq(2, quadtree_get_by_range(quadtree, 9, 11, 390, 9).length);
  assert_eq("two", quadtree_get_by_range(quadtree, 9, 11, 390, 9)[0].id);
  assert_eq("one", quadtree_get_by_range(quadtree, 9, 11, 390, 9)[1].id);
  assert_eq(2, quadtree_get_by_range(quadtree, 390, 9, 9, 11).length);
  assert_eq("two", quadtree_get_by_range(quadtree, 390, 9, 9, 11)[0].id);
  assert_eq("one", quadtree_get_by_range(quadtree, 390, 9, 9, 11)[1].id);
  // ranges with no results returns 0-length array
  console.log("  ranges with no results returns 0-length array");
  assert_eq(0, quadtree_get_by_range(quadtree, 0, 0, 5, 5).length);
  assert_eq(0, quadtree_get_by_range(quadtree, 5, 5, 0, 0).length);


  // get by id
  console.log("");
  console.log("");
  console.log("get by id:");
  console.log("");

  // lookup by id gets an object (and the object is the right one)
  console.log("  lookup by id gets an object (and the object is the right one)");
  assert_eq("one", quadtree_get_by_id(quadtree, "one").id);
  assert_eq("samesies", quadtree_get_by_id(quadtree, "samesies").id);


  // get by coords
  console.log("");
  console.log("");
  console.log("get by coords:");
  console.log("");

  // lookup by coords returns empty when no object present
  console.log("  lookup by coords returns empty when no object present");
  assert_eq(0, quadtree_get_by_coords(quadtree, 9, 11).length);
  assert_eq(0, quadtree_get_by_coords(quadtree, 9, 10).length);
  assert_eq(0, quadtree_get_by_coords(quadtree, 10, 9).length);
  // lookup by coords returns the right object for exact coords
  console.log("  lookup by coords returns the right object for exact coords");
  assert_eq(1, quadtree_get_by_coords(quadtree, 10, 10).length);
  assert_eq("one", quadtree_get_by_coords(quadtree, 10, 10)[0].id);
  // lookup by coords outside of or at epsilon returns no object
  console.log("  lookup by coords outside of or at epsilon returns no object");
  assert_eq(0, quadtree_get_by_coords(quadtree, 10.1, 10.1).length);
  assert_eq(0, quadtree_get_by_coords(quadtree, 10.01, 10.01).length);
  // lookup by coords within epsilon returns the right object
  console.log("  lookup by coords within epsilon returns the right object");
  assert_eq(1, quadtree_get_by_coords(quadtree, 10.001, 10.001).length);
  assert_eq("one", quadtree_get_by_coords(quadtree, 10.001, 10.001)[0].id);
  // lookup by coords within epsilon returns the right objects when multiple
  console.log("  lookup by coords within epsilon returns the right objects when multiple");
  assert_eq(2, quadtree_get_by_coords(quadtree, 210.001, 210.001).length);
  assert_eq("four", quadtree_get_by_coords(quadtree, 210.001, 210.001)[0].id);
  assert_eq("samesies", quadtree_get_by_coords(quadtree, 210.001, 210.001)[1].id);


  // remove by id
  console.log("");
  console.log("");
  console.log("remove by id:");
  console.log("");

  // remove by id has no impact when id not present
  console.log("  remove by id has no impact when id not present");
  assert_eq(entity_count, quadtree_get_by_range(quadtree, 0, 0, 400, 400).length);
  assert_eq(null, quadtree_remove_by_id(quadtree, "not_an_entity"));
  assert_eq(entity_count, quadtree_get_by_range(quadtree, 0, 0, 400, 400).length);
  // remove by id returns removed item, removes it, and only it (even if other items have same coords)
  console.log("  remove by id returns removed item, removes it, and only it (even if other items have same coords)");
  assert_eq(entity_count, quadtree_get_by_range(quadtree, 0, 0, 400, 400).length); // regular number of entities to start
  quadtree_insert(quadtree, {x: 30, y: 30, id: "newguy"});
  quadtree_insert(quadtree, {x: 30, y: 30, id: "newguy2"}); // insert 2
  assert_eq(entity_count+2, quadtree_get_by_range(quadtree, 0, 0, 400, 400).length); // entity count is 2 higher
  assert_eq(2, quadtree_get_by_range(quadtree, 30, 30, 30, 30).length);
  assert_eq(2, quadtree_get_by_coords(quadtree, 30, 30).length); // 2 found
  assert_eq("newguy2", quadtree_get_by_range(quadtree, 30, 30, 30, 30)[1].id);
  assert_eq("newguy2", quadtree_get_by_coords(quadtree, 30, 30)[1].id);
  assert_eq("newguy", quadtree_get_by_range(quadtree, 30, 30, 30, 30)[0].id);
  assert_eq("newguy", quadtree_get_by_coords(quadtree, 30, 30)[0].id); // right 2 found
  assert_eq("newguy", quadtree_get_by_id(quadtree, "newguy").id);
  assert_eq("newguy2", quadtree_get_by_id(quadtree, "newguy2").id); // both findable by id

  assert_eq("newguy", quadtree_remove_by_id(quadtree, "newguy").id); // remove

  assert_eq(1, quadtree_get_by_range(quadtree, 30, 30, 30, 30).length);
  assert_eq(1, quadtree_get_by_coords(quadtree, 30, 30).length); // one found
  assert_eq("newguy2", quadtree_get_by_range(quadtree, 30, 30, 30, 30)[0].id);
  assert_eq("newguy2", quadtree_get_by_coords(quadtree, 30, 30)[0].id); // right one
  assert_eq(null, quadtree_get_by_id(quadtree, "newguy")); // removed is null
  assert_eq("newguy2", quadtree_get_by_id(quadtree, "newguy2").id); // other is fine
  quadtree_remove_by_id(quadtree, "newguy2");

  // remove by range
  console.log("");
  console.log("");
  console.log("remove by range:");
  console.log("");

  // remove by range returns removed items, removes them, and only them
  console.log("  remove by range returns removed items, removes them, and only them");
  assert_eq(entity_count, quadtree_get_by_range(quadtree, 0, 0, 400, 400).length); // regular number of entities to start
  quadtree_insert(quadtree, {x: 30, y: 30, id: "newguy"});
  quadtree_insert(quadtree, {x: 30, y: 30, id: "newguy2"}); // insert 2
  assert_eq(entity_count+2, quadtree_get_by_range(quadtree, 0, 0, 400, 400).length); // entity count is 2 higher
  assert_eq(2, quadtree_get_by_range(quadtree, 30, 30, 30, 30).length);
  assert_eq(2, quadtree_get_by_coords(quadtree, 30, 30).length); // 2 found
  assert_eq("newguy2", quadtree_get_by_range(quadtree, 30, 30, 30, 30)[1].id);
  assert_eq("newguy2", quadtree_get_by_coords(quadtree, 30, 30)[1].id);
  assert_eq("newguy", quadtree_get_by_range(quadtree, 30, 30, 30, 30)[0].id);
  assert_eq("newguy", quadtree_get_by_coords(quadtree, 30, 30)[0].id); // right 2 found
  assert_eq("newguy", quadtree_get_by_id(quadtree, "newguy").id);
  assert_eq("newguy2", quadtree_get_by_id(quadtree, "newguy2").id); // both findable by id
  let removed = quadtree_remove_by_range(quadtree, 29, 29, 31, 31); // remove all in range
  assert_eq(2, removed.length); // right count
  assert_eq("newguy2", removed[0].id); // remove all in range
  assert_eq("newguy", removed[1].id); // remove all in range

  assert_eq(0, quadtree_get_by_range(quadtree, 30, 30, 30, 30).length);
  assert_eq(0, quadtree_get_by_coords(quadtree, 30, 30).length); // none found
  assert_eq(null, quadtree_get_by_id(quadtree, "newguy"));
  assert_eq(null, quadtree_get_by_id(quadtree, "newguy2")); // removed are null

  console.log("");
  console.log("");
  console.log(quadtree_tests + " tests run, " + quadtree_test_successes + " ok, " + quadtree_test_failures + " failed.");
}

function map_to_quadtree (map, leaf_size) {
  // iterate over map and produce quadtree
  let tree = build_quadtree(0, 0, map.width, map.height, leaf_size),
    entities = null;
  for (i in map.layers) {
    entities = map.layers[i];
    for (j in entities) {
      quadtree_insert(tree, entities[j]);
    }
  }

  return tree;
}

function assert_eq(fixture, property_to_test) {
  quadtree_tests += 1;
  quadtree_test_successes += 1;
  if (fixture !== property_to_test) {
    console.log("    F: fixture: " + fixture + " !== property: " + property_to_test);
    quadtree_test_failures += 1;
    quadtree_test_successes -= 1;
  }
}
