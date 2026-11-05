import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeOrder, moveBefore } from '../public/order.js';
test('atualização mantém preferências, remove expirados e acrescenta novos',()=>{
  assert.deepEqual(mergeOrder(['b','expired','a','b'],['a','b','c']),['b','a','c']);
});
test('movimentação mantém os cards ocultos por busca',()=>{
  assert.deepEqual(moveBefore(['a','hidden','b','c'],'c','a'),['c','a','hidden','b']);
});
test('movimentos inválidos preservam a ordem',()=>{
  assert.deepEqual(moveBefore(['a','b'],'unknown','a'),['a','b']);
  assert.deepEqual(moveBefore(['a','b'],'a','a'),['a','b']);
});
