/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { HTMLAttributes } from 'react';

export const ElasticMark = ({ ...props }: HTMLAttributes<SVGElement>) => (
  <svg
    width="64"
    height="19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby="elasticMark"
    {...props}
  >
    <title id="elasticMark">Elastic</title>
    <path d="" />
  </svg>
);
