/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { xyVisFunction } from '.';
import { createMockExecutionContext } from '@kbn/expressions-plugin/common/mocks';
import { sampleArgs, sampleLayer } from '../__mocks__';
import { XY_VIS } from '../constants';

describe('xyVis', () => {
  test('it renders with the specified data and args', async () => {
    const { data, args } = sampleArgs();
    const { layers, ...rest } = args;
    const { layerId, layerType, table, type, ...restLayerArgs } = sampleLayer;
    const result = await xyVisFunction.fn(
      data,
      { ...rest, ...restLayerArgs, referenceLines: [], annotationLayers: [] },
      createMockExecutionContext()
    );

    expect(result).toEqual({
      type: 'render',
      as: XY_VIS,
      value: {
        args: {
          ...rest,
          layers: [{ layerType, table: data, layerId: 'dataLayers-0', type, ...restLayerArgs }],
        },
      },
    });
  });

  test('it should throw error if markSizeRatio is lower then 1 or greater then 100', async () => {
    const { data, args } = sampleArgs();
    const { layers, ...rest } = args;
    expect(
      xyVisFunction.fn(
        data,
        {
          ...rest,
          ...{ ...sampleLayer, markSizeAccessor: 'b' },
          markSizeRatio: 0,
          referenceLines: [],
          annotationLayers: [],
        },
        createMockExecutionContext()
      )
    ).rejects.toThrowErrorMatchingSnapshot();

    expect(
      xyVisFunction.fn(
        data,
        {
          ...rest,
          ...{ ...sampleLayer, markSizeAccessor: 'b' },
          markSizeRatio: 101,
          referenceLines: [],
          annotationLayers: [],
        },
        createMockExecutionContext()
      )
    ).rejects.toThrowErrorMatchingSnapshot();
  });
  test('it should throw error if minTimeBarInterval is invalid', async () => {
    const { data, args } = sampleArgs();
    const { layers, ...rest } = args;
    const { layerId, layerType, table, type, ...restLayerArgs } = sampleLayer;
    expect(
      xyVisFunction.fn(
        data,
        {
          ...rest,
          ...restLayerArgs,
          minTimeBarInterval: '1q',
          referenceLines: [],
          annotationLayers: [],
        },
        createMockExecutionContext()
      )
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test('it should throw error if minTimeBarInterval applied for not time bar chart', async () => {
    const { data, args } = sampleArgs();
    const { layers, ...rest } = args;
    const { layerId, layerType, table, type, ...restLayerArgs } = sampleLayer;
    expect(
      xyVisFunction.fn(
        data,
        {
          ...rest,
          ...restLayerArgs,
          minTimeBarInterval: '1h',
          referenceLines: [],
          annotationLayers: [],
        },
        createMockExecutionContext()
      )
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test('it should throw error if addTimeMarker applied for not time chart', async () => {
    const { data, args } = sampleArgs();
    const { layers, ...rest } = args;
    const { layerId, layerType, table, type, ...restLayerArgs } = sampleLayer;
    expect(
      xyVisFunction.fn(
        data,
        {
          ...rest,
          ...restLayerArgs,
          addTimeMarker: true,
          referenceLines: [],
          annotationLayers: [],
        },
        createMockExecutionContext()
      )
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test('it should throw error if splitRowAccessor is pointing to the absent column', async () => {
    const { data, args } = sampleArgs();
    const { layers, ...rest } = args;
    const { layerId, layerType, table, type, ...restLayerArgs } = sampleLayer;
    const splitRowAccessor = 'absent-accessor';

    expect(
      xyVisFunction.fn(
        data,
        {
          ...rest,
          ...restLayerArgs,
          referenceLines: [],
          annotationLayers: [],
          splitRowAccessor,
        },
        createMockExecutionContext()
      )
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test('it should throw error if splitColumnAccessor is pointing to the absent column', async () => {
    const { data, args } = sampleArgs();
    const { layers, ...rest } = args;
    const { layerId, layerType, table, type, ...restLayerArgs } = sampleLayer;
    const splitColumnAccessor = 'absent-accessor';

    expect(
      xyVisFunction.fn(
        data,
        {
          ...rest,
          ...restLayerArgs,
          referenceLines: [],
          annotationLayers: [],
          splitColumnAccessor,
        },
        createMockExecutionContext()
      )
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test('it should throw error if markSizeRatio is specified while markSizeAccessor is not', async () => {
    const { data, args } = sampleArgs();
    const { layers, ...rest } = args;
    const { layerId, layerType, table, type, ...restLayerArgs } = sampleLayer;

    expect(
      xyVisFunction.fn(
        data,
        {
          ...rest,
          ...restLayerArgs,
          referenceLines: [],
          annotationLayers: [],
          markSizeRatio: 5,
        },
        createMockExecutionContext()
      )
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
