
exports.up = function(knex) {
    return knex.schema.createTable('images', function (table){
        table.increments()
        table.string('image')
        table.integer('post_id').unsigned().notNullable()
        table.foreign('post_id').references('post.id').inTable('post')
    })
};

exports.down = function(knex) {
  
};
