<?php

use Phinx\Migration\AbstractMigration;

class Coeffs extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('coeffs');
        $table
            ->addColumn('name', 'string')
            ->addColumn('user_id', 'integer', ['signed' => false])
            ->addColumn('deleted', 'integer', ['signed' => false, 'default' => 0])
            ->addColumn('values', 'text')
            ->addIndex(['user_id'], ['unique' => false])
            ->create();
    }
}
