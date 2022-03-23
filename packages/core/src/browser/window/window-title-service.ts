// *****************************************************************************
// Copyright (C) 2022 TypeFox and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// This Source Code may also be made available under the following Secondary
// Licenses when the conditions for such availability set forth in the Eclipse
// Public License v. 2.0 are satisfied: GNU General Public License, version 2
// with the GNU Classpath Exception which is available at
// https://www.gnu.org/software/classpath/license.html.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
// *****************************************************************************

import { injectable } from 'inversify';
import { Emitter, Event } from '../../common/event';

export interface WindowTitlePart {
    id?: string
    value?: string
    priority?: number
    event?: Event<string | undefined>
}

@injectable()
export class WindowTitleService {

    protected _title = '';

    protected onDidChangeTitleEmitter = new Emitter<string>();
    protected titleParts: WindowTitlePart[] = [];

    get onDidChangeTitle(): Event<string> {
        return this.onDidChangeTitleEmitter.event;
    }

    get title(): string {
        return this._title;
    }

    registerPart(titlePart: WindowTitlePart): void {
        this.titleParts.push(titlePart);
        titlePart.event?.(title => {
            titlePart.value = title;
            this.updateTitle();
        });
        if (titlePart.value) {
            this.updateTitle();
        }
    }

    unregisterPart(id: string): void {
        const index = this.titleParts.findIndex(e => e.id === id);
        if (index >= 0) {
            this.titleParts.splice(index, 1);
            this.updateTitle();
        }
    }

    protected updateTitle(): void {
        const sortedParts = this.titleParts.sort((a, b) => (b.priority ?? 100) - (a.priority ?? 100));
        this._title = sortedParts.map(e => e.value).filter(e => e).join(' - ');
        this.onDidChangeTitleEmitter.fire(this._title);
    }

}
