/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { get, isEmpty } from 'lodash';
import {
  EuiDataGridColumn,
  EuiDataGridControlColumn,
  EuiProgress,
  EuiDataGridSorting,
  EuiEmptyPrompt,
} from '@elastic/eui';
import type { ValidFeatureId } from '@kbn/rule-data-utils';
import type { RuleRegistrySearchRequestPagination } from '@kbn/rule-registry-plugin/common';
import { Storage } from '@kbn/kibana-utils-plugin/public';
import type {
  QueryDslQueryContainer,
  SortCombinations,
} from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { useFetchAlerts } from './hooks/use_fetch_alerts';
import { AlertsTable } from './alerts_table';
import { AlertsTableConfigurationRegistry, RenderCellValueProps } from '../../../types';
import { TypeRegistry } from '../../type_registry';
import { ALERTS_TABLE_CONF_ERROR_MESSAGE, ALERTS_TABLE_CONF_ERROR_TITLE } from './translations';

const DefaultPagination = {
  pageSize: 10,
  pageIndex: 0,
};

export interface AlertsTableStateProps {
  alertsTableConfigurationRegistry: TypeRegistry<AlertsTableConfigurationRegistry>;
  configurationId: string;
  id: string;
  featureIds: ValidFeatureId[];
  query: Pick<QueryDslQueryContainer, 'bool' | 'ids'>;
}

interface AlertsTableStorage {
  columns: EuiDataGridColumn[];
  sort: SortCombinations[];
}

const EmptyConfiguration = {
  id: '',
  columns: [],
  sort: [],
};

const AlertsTableState = ({
  alertsTableConfigurationRegistry,
  configurationId,
  id,
  featureIds,
  query,
}: AlertsTableStateProps) => {
  const hasAlertsTableConfiguration =
    alertsTableConfigurationRegistry?.has(configurationId) ?? false;
  const alertsTableConfiguration = hasAlertsTableConfiguration
    ? alertsTableConfigurationRegistry.get(configurationId)
    : EmptyConfiguration;

  const storage = useRef(new Storage(window.localStorage));
  const localAlertsTableConfig = storage.current.get(id) as Partial<AlertsTableStorage>;

  const storageAlertsTable = useRef<AlertsTableStorage>({
    columns:
      localAlertsTableConfig &&
      localAlertsTableConfig.columns &&
      !isEmpty(localAlertsTableConfig?.columns)
        ? localAlertsTableConfig?.columns ?? []
        : alertsTableConfiguration?.columns ?? [],
    sort:
      localAlertsTableConfig &&
      localAlertsTableConfig.sort &&
      !isEmpty(localAlertsTableConfig?.sort)
        ? localAlertsTableConfig?.sort ?? []
        : alertsTableConfiguration?.sort ?? [],
  });

  const [showCheckboxes] = useState(false);
  const [sort, setSort] = useState<SortCombinations[]>(storageAlertsTable.current.sort);
  const [pagination, setPagination] = useState(DefaultPagination);
  const [columns, setColumns] = useState<EuiDataGridColumn[]>(storageAlertsTable.current.columns);

  const [
    isLoading,
    { alerts, isInitializing, getInspectQuery, refetch: refresh, totalAlerts: alertsCount },
  ] = useFetchAlerts({
    fields: columns.map((col) => ({ field: col.id, include_unmapped: true })),
    featureIds,
    query,
    pagination,
    sort,
    skip: false,
  });

  const onPageChange = useCallback((_pagination: RuleRegistrySearchRequestPagination) => {
    setPagination(_pagination);
  }, []);
  const onSortChange = useCallback(
    (_sort: EuiDataGridSorting['columns']) => {
      const newSort = _sort.map((sortItem) => {
        return {
          [sortItem.id]: {
            order: sortItem.direction,
          },
        };
      });

      storageAlertsTable.current = {
        ...storageAlertsTable.current,
        sort: newSort,
      };
      storage.current.set(id, storageAlertsTable.current);
      setSort(newSort);
    },
    [id]
  );
  const onColumnsChange = useCallback(
    (newColumns: EuiDataGridControlColumn[]) => {
      setColumns(newColumns);
      storageAlertsTable.current = {
        ...storageAlertsTable.current,
        columns: newColumns,
      };
      storage.current.set(id, storageAlertsTable.current);
    },
    [id, storage]
  );

  const useFetchAlertsData = useCallback(() => {
    return {
      activePage: pagination.pageIndex,
      alerts,
      alertsCount,
      isInitializing,
      isLoading,
      getInspectQuery,
      onColumnsChange,
      onPageChange,
      onSortChange,
      refresh,
      sort,
    };
  }, [
    alerts,
    alertsCount,
    getInspectQuery,
    isInitializing,
    isLoading,
    onColumnsChange,
    onPageChange,
    onSortChange,
    pagination.pageIndex,
    refresh,
    sort,
  ]);

  const tableProps = useMemo(
    () => ({
      columns,
      bulkActions: [],
      deletedEventIds: [],
      disabledCellActions: [],
      pageSize: pagination.pageSize,
      pageSizeOptions: [1, 2, 5, 10, 20, 50, 100],
      leadingControlColumns: [],
      renderCellValue: ({ alert, field }: RenderCellValueProps) => {
        // any is required here to improve typescript performance
        const value = get(alert as any, field, [])[0] as string;
        return value ?? 'N/A';
      },
      showCheckboxes,
      trailingControlColumns: [],
      useFetchAlertsData,
      'data-test-subj': 'internalAlertsState',
    }),
    [columns, pagination.pageSize, showCheckboxes, useFetchAlertsData]
  );

  return hasAlertsTableConfiguration ? (
    <>
      {isLoading && (
        <EuiProgress size="xs" color="accent" data-test-subj="internalAlertsPageLoading" />
      )}
      <AlertsTable {...tableProps} />
    </>
  ) : (
    <EuiEmptyPrompt
      data-test-subj="alertsTableNoConfiguration"
      iconType="watchesApp"
      title={<h2>{ALERTS_TABLE_CONF_ERROR_TITLE}</h2>}
      body={<p>{ALERTS_TABLE_CONF_ERROR_MESSAGE}</p>}
    />
  );
};

export { AlertsTableState };
// eslint-disable-next-line import/no-default-export
export { AlertsTableState as default };
