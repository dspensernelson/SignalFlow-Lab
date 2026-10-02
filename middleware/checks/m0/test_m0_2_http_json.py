"""Check m0-2: DonorClient returns typed models and raises a clear error on
a missing donor."""

from __future__ import annotations

import pytest

from tools.client import CrmError, Donation, Donor, DonorClient, DonorNotFound


@pytest.fixture
def client(fresh_crm) -> DonorClient:
    return DonorClient(fresh_crm.base_url, timeout=5.0)


def test_get_donor_returns_a_typed_model(client):
    donor = client.get_donor(1)
    assert isinstance(donor, Donor)
    assert donor.email == "maria.alvarez@example.org"
    assert donor.full_name == "Maria Alvarez"


def test_find_donors_is_precise_about_near_duplicates(client):
    hits = client.find_donors("alvarez")
    assert sorted(d.id for d in hits) == [1, 2]
    assert all(isinstance(d, Donor) for d in hits)
    exact = client.find_donors("m.alvarezreyes@example.org")
    assert [d.id for d in exact] == [2]


def test_get_donations_is_typed_and_newest_first(client):
    gifts = client.get_donations(1)
    assert gifts and all(isinstance(g, Donation) for g in gifts)
    assert all(isinstance(g.amount_cents, int) for g in gifts)
    assert [g.received_at for g in gifts] == sorted((g.received_at for g in gifts), reverse=True)


def test_missing_donor_raises_donor_not_found(client):
    with pytest.raises(DonorNotFound) as info:
        client.get_donor(999)
    assert info.value.donor_id == 999
    assert "999" in str(info.value)
    assert isinstance(info.value, CrmError)


def test_missing_donor_donations_also_raise(client):
    with pytest.raises(DonorNotFound):
        client.get_donations(999)
